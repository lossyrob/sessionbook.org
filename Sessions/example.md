# Session Work Structured Tune Example

This file is a reference example for the structured tune syntax used in
`Sessions/*_session_work.md`.

- `=>` before any `= version:` line = tune-level link
- `=>` after `= version:` = version-level link
- `= part:` = named part like A / B / C
- `= alt:` = alternate pass or alternate part for that named part
- `>` notes are still tune-level notes for the whole tune

The example below uses `Geese in the Bog` from the current session and invents
alternate parts / versions purely to demonstrate the syntax.

````md
**Geese in the Bog** (Ador)

=> https://thesession.org/tunes/43#setting55355
=> Tune overview playlist | https://open.spotify.com/track/EXAMPLE

> Tune-level note: first version is the one we expect to use most often.
> Alternate parts below are just rehearsal options.

= version: Session default
=> YouTube rehearsal take | https://youtu.be/EXAMPLE1

= part: A
```
| C / G / | C / G / | C / G / | Am / / / |
| C / G / | C / G / | C / G / | Am / / / |
```

= alt: A | second pass lift
```
| C / G / | C / G / | Em / G / | Am / / / |
| C / G / | C / G / | C / G / | Am / / / |
```

= part: B
```
| C / G / | Am / G / | C / G / | Am / / / |
| C / G / | Am / G / | C / G / | Am / / / |
```

= alt: B | third pass walk-up
```
| C / G / | Am / G / | C / Em / | Am / / / |
| C / G / | Am / G / | C / G / | D / Am / |
```

= version: Recording variant
=> Favorite YouTube cut | https://youtu.be/EXAMPLE2
=> Favorite Spotify cut | https://open.spotify.com/track/EXAMPLE2

= part: A
```
| Am / / / | G / / / | Am / / / | G / Am / |
| Am / / / | G / / / | C / / / | G / Am / |
```

= part: B
```
| Am / / / | C / / / | G / / / | Am / / / |
| Am / / / | C / / / | G / / / | Am / / / |
```
````

Current limitation: version-specific notes are not structured yet, so `>` notes
still belong to the tune as a whole.
