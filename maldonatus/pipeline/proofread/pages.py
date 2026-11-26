"""--pages parsing: "0032,0065,0063", "0020-0103", or a mix ("0020-0025,0050")."""


def parse_pages(spec):
    out = []
    for part in str(spec).split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-")
            out += [f"{i:04d}" for i in range(int(a), int(b) + 1)]
        else:
            out.append(f"{int(part):04d}")
    seen = set()
    return [p for p in out if not (p in seen or seen.add(p))]
