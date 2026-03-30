#!/usr/bin/env python3
"""
Render a SessionBook session-work PDF from JSON sent on stdin.

The JSON payload is expected to match the print model produced by
`src/lib/session-work/pdf.ts`.
"""

import argparse
import json
import logging
import re
import sys
from pathlib import Path

try:
    from fpdf import FPDF
except ModuleNotFoundError as exc:
    print(
        "Missing Python dependency: fpdf2. Install it with "
        "`python3 -m pip install -r requirements-pdf.txt`.",
        file=sys.stderr,
    )
    raise

logging.getLogger("fontTools").setLevel(logging.ERROR)


class SessionPdf(FPDF):
    def footer(self):
        self.set_y(-6)
        self.set_font("Helvetica", "", 7)
        self.set_text_color(120, 120, 120)
        self.cell(0, 3, sanitize(str(self.page_no())), align="C")
        self.set_text_color(0, 0, 0)


# --- Layout constants (all in mm) ---
PAGE_W = 215.9  # Letter width
PAGE_H = 279.4  # Letter height
MARGIN_LEFT = 8
MARGIN_RIGHT = 8
MARGIN_TOP = 8
MARGIN_BOTTOM = 8
USABLE_W = PAGE_W - MARGIN_LEFT - MARGIN_RIGHT
USABLE_H = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM
CHART_FONT_FAMILY = "Monaco"
CHART_FONT_PATH = "/System/Library/Fonts/Monaco.ttf"

COMPACT_COL_GAP = 6
COMPACT_TUNE_FONT_SIZE = 12.0
COMPACT_CHART_FONT_SIZE = 9.9
COMPACT_SET_GAP = 4.5
COMPACT_TUNE_GAP = 2.05
COMPACT_CHART_LINE_H = 4.8
COMPACT_PART_GAP = 2.8
COMPACT_ANN_LINE_H = 3.25

PRINT_LARGE_COL_GAP = 0
PRINT_LARGE_TUNE_FONT_SIZE = 13.0
PRINT_LARGE_CHART_FONT_SIZE = 11.0
PRINT_LARGE_SET_GAP = 5.0
PRINT_LARGE_TUNE_GAP = 2.2
PRINT_LARGE_CHART_LINE_H = 5.2
PRINT_LARGE_PART_GAP = 3.0
PRINT_LARGE_ANN_LINE_H = 3.75

SECTION_FONT_SIZE = 10.2
SECTION_LINE_H = 4.2
SECTION_GAP = 1.2

NOTE_FONT_SIZE = 8.2
NOTE_LINE_H = 3.2
NOTE_PARAGRAPH_GAP = NOTE_LINE_H * 0.7
NOTE_BLOCK_GAP = 1.0

VERSION_FONT_SIZE = 8.4
VERSION_LINE_H = 3.3

PART_LABEL_FONT_SIZE = 8.6
PART_LABEL_LINE_H = 3.4

COL_GAP = COMPACT_COL_GAP
COL_W = (USABLE_W - COL_GAP) / 2
TUNE_FONT_SIZE = COMPACT_TUNE_FONT_SIZE
CHART_FONT_SIZE = COMPACT_CHART_FONT_SIZE
SET_GAP = COMPACT_SET_GAP
TUNE_GAP = COMPACT_TUNE_GAP
CHART_LINE_H = COMPACT_CHART_LINE_H
PART_GAP = COMPACT_PART_GAP
ANN_LINE_H = COMPACT_ANN_LINE_H


def sanitize(text):
    """Replace unicode chars that latin-1 core fonts can't handle."""
    return (
        text.replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2014", "--")
        .replace("\u2013", "-")
        .replace("\u2192", "->")
    )


def configure_fonts(pdf):
    """Use a sharper installed font for chart text when available."""
    if Path(CHART_FONT_PATH).exists():
        pdf.add_font(CHART_FONT_FAMILY, fname=CHART_FONT_PATH)
        return CHART_FONT_FAMILY
    return "Courier"


def apply_layout(mode):
    """Apply either the compact or print-large layout preset."""
    global COL_GAP, COL_W, TUNE_FONT_SIZE, CHART_FONT_SIZE
    global SET_GAP, TUNE_GAP, CHART_LINE_H, PART_GAP, ANN_LINE_H

    if mode == "print-large":
        COL_GAP = PRINT_LARGE_COL_GAP
        COL_W = USABLE_W
        TUNE_FONT_SIZE = PRINT_LARGE_TUNE_FONT_SIZE
        CHART_FONT_SIZE = PRINT_LARGE_CHART_FONT_SIZE
        SET_GAP = PRINT_LARGE_SET_GAP
        TUNE_GAP = PRINT_LARGE_TUNE_GAP
        CHART_LINE_H = PRINT_LARGE_CHART_LINE_H
        PART_GAP = PRINT_LARGE_PART_GAP
        ANN_LINE_H = PRINT_LARGE_ANN_LINE_H
    else:
        COL_GAP = COMPACT_COL_GAP
        COL_W = (USABLE_W - COL_GAP) / 2
        TUNE_FONT_SIZE = COMPACT_TUNE_FONT_SIZE
        CHART_FONT_SIZE = COMPACT_CHART_FONT_SIZE
        SET_GAP = COMPACT_SET_GAP
        TUNE_GAP = COMPACT_TUNE_GAP
        CHART_LINE_H = COMPACT_CHART_LINE_H
        PART_GAP = COMPACT_PART_GAP
        ANN_LINE_H = COMPACT_ANN_LINE_H


def load_document():
    try:
        return json.load(sys.stdin)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Invalid JSON input: {exc}") from exc


def _count_annotations(line):
    """Count how many annotation mini-lines a chart line will produce."""
    count = 0
    if re.search(r"\{.+?\}\s*$", line):
        count += 1
    if re.match(r"^\s*\{.+?\}", line):
        count += 1
    return count


def wrap_text(pdf, text, width):
    lines = []
    for paragraph in sanitize(text).split("\n"):
        if not paragraph.strip():
            lines.append("")
            continue

        words = paragraph.split()
        current = words[0]

        for word in words[1:]:
            candidate = f"{current} {word}"
            if pdf.get_string_width(candidate) <= width:
                current = candidate
            else:
                lines.append(current)
                current = word

        lines.append(current)

    return lines


def note_height(pdf, text, width):
    if not text or not text.strip():
        return 0

    pdf.set_font("Helvetica", "I", NOTE_FONT_SIZE)
    height = 0
    for line in wrap_text(pdf, text, width):
        height += NOTE_PARAGRAPH_GAP if not line else NOTE_LINE_H

    return height + NOTE_BLOCK_GAP


def render_note_block(pdf, text, x, y, width):
    if not text or not text.strip():
        return y

    pdf.set_font("Helvetica", "I", NOTE_FONT_SIZE)
    pdf.set_text_color(70, 70, 70)

    for line in wrap_text(pdf, text, width):
        if not line:
            y += NOTE_PARAGRAPH_GAP
            continue

        pdf.set_xy(x, y)
        pdf.cell(width, NOTE_LINE_H, line)
        y += NOTE_LINE_H

    pdf.set_text_color(0, 0, 0)
    return y + NOTE_BLOCK_GAP


def chart_lines_height(chart_lines):
    height = 0
    for chart_line in chart_lines:
        if chart_line == "":
            height += PART_GAP
            continue
        height += CHART_LINE_H
        height += _count_annotations(chart_line) * ANN_LINE_H
    return height


def tune_height(pdf, tune):
    height = TUNE_FONT_SIZE * 0.42 + 1.1

    if tune.get("versionLabel"):
        height += VERSION_LINE_H

    height += note_height(pdf, tune.get("notes", ""), COL_W)

    for index, part in enumerate(tune.get("parts", [])):
        if index > 0:
            height += PART_GAP
        if part.get("label"):
            height += PART_LABEL_LINE_H
        height += chart_lines_height(part.get("chartLines", []))

    if not tune.get("parts"):
        height += CHART_LINE_H

    return height


def set_height(pdf, tuneset):
    height = 0

    if tuneset.get("sectionHeading"):
        height += SECTION_LINE_H + SECTION_GAP

    height += note_height(pdf, tuneset.get("notes", ""), COL_W)

    for index, tune in enumerate(tuneset.get("tunes", [])):
        if index > 0:
            height += TUNE_GAP
        height += tune_height(pdf, tune)

    return height


def column_height(pdf, column_sets):
    """Total height of a rendered column of tune sets."""
    height = 0
    for index, tuneset in enumerate(column_sets):
        if index > 0:
            height += SET_GAP
        height += set_height(pdf, tuneset)
    return height


def _best_page_split(pdf, page_sets):
    """Choose the most balanced split of consecutive sets across two columns."""
    best = None
    for split in range(1, len(page_sets) + 1):
        left_sets = page_sets[:split]
        right_sets = page_sets[split:]
        left_height = column_height(pdf, left_sets)
        right_height = column_height(pdf, right_sets)
        if left_height <= USABLE_H and right_height <= USABLE_H:
            metrics = (
                max(left_height, right_height),
                abs(left_height - right_height),
                1 if not right_sets else 0,
            )
            if best is None or metrics < best[0]:
                best = (metrics, split)
    if best is None:
        return None
    return best[1]


def paginate_sets(pdf, sets):
    """Group consecutive sets into balanced two-column pages."""
    pages = []
    start = 0
    while start < len(sets):
        best_end = None
        best_split = None
        for end in range(start + 1, len(sets) + 1):
            split = _best_page_split(pdf, sets[start:end])
            if split is None:
                break
            best_end = end
            best_split = split
        if best_end is None:
            raise ValueError("A tune set is too tall to fit in a single column")
        page_sets = sets[start:best_end]
        pages.append((page_sets[:best_split], page_sets[best_split:]))
        start = best_end
    return pages


def paginate_one_column(pdf, sets):
    """Group consecutive sets into full-width single-column pages."""
    pages = []
    current_page = []
    current_height = 0

    for tuneset in sets:
        tuneset_height = set_height(pdf, tuneset)
        add_height = tuneset_height if not current_page else SET_GAP + tuneset_height

        if current_page and current_height + add_height > USABLE_H:
            pages.append(current_page)
            current_page = [tuneset]
            current_height = tuneset_height
        else:
            current_page.append(tuneset)
            current_height += add_height

    if current_page:
        pages.append(current_page)

    return pages


def draw_set_separator(pdf, x, y):
    y += SET_GAP / 2
    pdf.set_draw_color(180, 180, 180)
    pdf.line(x, y, x + COL_W, y)
    pdf.set_draw_color(0, 0, 0)
    return y + SET_GAP / 2


def render_section_heading(pdf, heading, x, y):
    pdf.set_font("Helvetica", "B", SECTION_FONT_SIZE)
    pdf.set_text_color(60, 60, 60)
    pdf.set_xy(x, y)
    pdf.cell(COL_W, SECTION_LINE_H, sanitize(heading.upper()))
    pdf.set_text_color(0, 0, 0)
    return y + SECTION_LINE_H + SECTION_GAP


def measure_grid_width(measures):
    return max(1, len(measures))


def tune_max_measures(tune):
    max_measures = 0
    for part in tune.get("parts", []):
        for chart_line in part.get("chartLines", []):
            if chart_line == "":
                continue
            text = sanitize(re.sub(r"\{.+?\}", "", chart_line))
            measures = [piece for piece in text.split("|") if piece.strip()]
            max_measures = max(max_measures, len(measures))
    return max_measures


def render_chart_lines(pdf, chart_lines, x, y, chart_font, max_measures):
    pdf.set_font(chart_font, "", CHART_FONT_SIZE)

    for chart_line in chart_lines:
        if chart_line == "":
            y += PART_GAP
            continue

        text = sanitize(chart_line)
        ann_right = None
        ann_left = None

        ann_match = re.search(r"\{(.+?)\}\s*$", text)
        if ann_match:
            ann_right = ann_match.group(1)
            text = text[: ann_match.start()].rstrip()

        ann_match = re.match(r"^\s*\{(.+?)\}\s*", text)
        if ann_match:
            ann_left = ann_match.group(1)
            text = text[ann_match.end() :]

        if ann_left:
            pdf.set_font("Helvetica", "I", CHART_FONT_SIZE - 1.5)
            pdf.set_xy(x, y)
            pdf.cell(COL_W, ANN_LINE_H, ann_left)
            pdf.set_font(chart_font, "", CHART_FONT_SIZE)
            y += ANN_LINE_H

        measures = [piece.strip() for piece in text.split("|") if piece.strip()]
        if not measures:
            if ann_right:
                pdf.set_font("Helvetica", "I", CHART_FONT_SIZE - 1.5)
                ann_width = pdf.get_string_width(ann_right) + 1
                pdf.set_xy(x + COL_W - ann_width, y)
                pdf.cell(ann_width, ANN_LINE_H, ann_right, align="R")
                pdf.set_font(chart_font, "", CHART_FONT_SIZE)
                y += ANN_LINE_H
            continue

        grid = max(max_measures, measure_grid_width(measures))
        cell_width = COL_W / grid
        pdf.set_draw_color(120, 120, 120)
        for index, measure in enumerate(measures):
            measure_x = x + index * cell_width
            pdf.line(measure_x, y, measure_x, y + CHART_LINE_H)
            beats = measure.split()
            if beats:
                pad = 0.35
                inner_width = cell_width - 2 * pad
                beat_width = inner_width / len(beats)
                for beat_index, beat in enumerate(beats):
                    beat_x = measure_x + pad + beat_index * beat_width
                    pdf.set_xy(beat_x, y)
                    pdf.cell(beat_width, CHART_LINE_H, beat, align="C")
        pdf.line(
            x + len(measures) * cell_width,
            y,
            x + len(measures) * cell_width,
            y + CHART_LINE_H,
        )
        pdf.set_draw_color(0, 0, 0)

        y += CHART_LINE_H

        if ann_right:
            pdf.set_font("Helvetica", "I", CHART_FONT_SIZE - 1.5)
            ann_width = pdf.get_string_width(ann_right) + 1
            pdf.set_xy(x + COL_W - ann_width, y)
            pdf.cell(ann_width, ANN_LINE_H, ann_right, align="R")
            pdf.set_font(chart_font, "", CHART_FONT_SIZE)
            y += ANN_LINE_H

    return y


def render_tune(pdf, tune, x, y, chart_font):
    pdf.set_font("Helvetica", "B", TUNE_FONT_SIZE)
    pdf.set_xy(x, y)
    pdf.cell(COL_W, TUNE_FONT_SIZE * 0.42, sanitize(tune["title"]))
    y += TUNE_FONT_SIZE * 0.42 + 1.1

    if tune.get("versionLabel"):
        pdf.set_font("Helvetica", "I", VERSION_FONT_SIZE)
        pdf.set_text_color(90, 90, 90)
        pdf.set_xy(x, y)
        pdf.cell(COL_W, VERSION_LINE_H, sanitize(tune["versionLabel"]))
        pdf.set_text_color(0, 0, 0)
        y += VERSION_LINE_H

    y = render_note_block(pdf, tune.get("notes", ""), x, y, COL_W)

    max_measures = tune_max_measures(tune)
    parts = tune.get("parts", [])

    if not parts:
        return y + CHART_LINE_H

    for index, part in enumerate(parts):
        if index > 0:
            y += PART_GAP

        if part.get("label"):
            pdf.set_font("Helvetica", "I", PART_LABEL_FONT_SIZE)
            pdf.set_xy(x, y)
            pdf.cell(COL_W, PART_LABEL_LINE_H, sanitize(part["label"]))
            y += PART_LABEL_LINE_H

        y = render_chart_lines(
            pdf,
            part.get("chartLines", []),
            x,
            y,
            chart_font,
            max_measures,
        )

    return y


def render_set(pdf, tuneset, x, y, chart_font):
    if tuneset.get("sectionHeading"):
        y = render_section_heading(pdf, tuneset["sectionHeading"], x, y)

    y = render_note_block(pdf, tuneset.get("notes", ""), x, y, COL_W)

    for tune_index, tune in enumerate(tuneset.get("tunes", [])):
        if tune_index > 0:
            y += TUNE_GAP
        y = render_tune(pdf, tune, x, y, chart_font)

    return y


def render_column(pdf, column_sets, x, chart_font):
    y = MARGIN_TOP
    for set_index, tuneset in enumerate(column_sets):
        if set_index > 0:
            y = draw_set_separator(pdf, x, y)
        y = render_set(pdf, tuneset, x, y, chart_font)
    return y


def generate_pdf(document, output_path, print_large=False):
    pdf = SessionPdf(orientation="P", unit="mm", format="Letter")
    pdf.set_auto_page_break(False)
    pdf.set_margins(MARGIN_LEFT, MARGIN_TOP, MARGIN_RIGHT)
    pdf.set_title(sanitize(document.get("title", "SessionBook Session")))
    chart_font = configure_fonts(pdf)
    sets = document.get("sets", [])

    if print_large:
        pages = paginate_one_column(pdf, sets)
        for column_sets in pages:
            pdf.add_page()
            render_column(pdf, column_sets, MARGIN_LEFT, chart_font)
    else:
        pages = paginate_sets(pdf, sets)
        for left_sets, right_sets in pages:
            pdf.add_page()
            render_column(pdf, left_sets, MARGIN_LEFT, chart_font)
            render_column(pdf, right_sets, MARGIN_LEFT + COL_W + COL_GAP, chart_font)

    pdf.output(output_path)
    return len(pages)


def count_tunes(document):
    return sum(len(tuneset.get("tunes", [])) for tuneset in document.get("sets", []))


def parse_args():
    parser = argparse.ArgumentParser(
        description="Render a SessionBook session-work PDF from JSON on stdin."
    )
    parser.add_argument("--output", required=True, help="Path to the output PDF")
    parser.add_argument(
        "--print-large",
        action="store_true",
        help="Render a single-column large-print layout",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    apply_layout("print-large" if args.print_large else "compact")
    document = load_document()
    pages = generate_pdf(document, args.output, print_large=args.print_large)
    print(
        f"Generated {args.output}: {pages} page(s), {count_tunes(document)} tunes"
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)
