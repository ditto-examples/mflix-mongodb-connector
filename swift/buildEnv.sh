#!/bin/sh
#
# Generates Env.swift from the root .env file.
#
# Only the Ditto keys below are emitted. The root .env may hold unrelated
# secrets (a MongoDB Atlas URI, for example) and those must never be compiled
# into the app binary.

set -eu

REQUIRED_KEYS="DITTO_DATABASE_ID DITTO_DEVELOPMENT_TOKEN DITTO_SERVER_URL"

if [ "$#" -ne 2 ]; then
    echo "usage: buildEnv.sh /path/to/.env /output/directory" >&2
    exit 1
fi

env_file=$1
output_dir=$2

if [ ! -f "$env_file" ]; then
    echo "error: missing root .env file at $env_file. Copy .env.template to .env and fill in the Ditto development credentials." >&2
    exit 1
fi

# Reads one key from the .env file. Tolerates surrounding quotes, an `export`
# prefix, spaces around `=`, and CRLF line endings, so the same file works for
# the Swift, Flutter, and React Native apps.
read_env_value() {
    awk -v key="$1" '
        { sub(/\r$/, "") }
        /^[[:space:]]*#/ { next }
        {
            line = $0
            sub(/^[[:space:]]*export[[:space:]]+/, "", line)
            eq = index(line, "=")
            if (eq == 0) next
            k = substr(line, 1, eq - 1)
            v = substr(line, eq + 1)
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", k)
            gsub(/^[[:space:]]+|[[:space:]]+$/, "", v)
            if (k != key) next
            if (v ~ /^".*"$/ || v ~ /^'"'"'.*'"'"'$/) v = substr(v, 2, length(v) - 2)
            print v
            exit
        }
    ' "$env_file"
}

# Escapes backslashes and double quotes so any value stays a valid Swift literal.
swift_literal() {
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

missing=""
for key in $REQUIRED_KEYS; do
    if [ -z "$(read_env_value "$key")" ]; then
        missing="$missing $key"
    fi
done

if [ -n "$missing" ]; then
    echo "error: $env_file is missing a value for:$missing" >&2
    echo "Copy .env.template to .env and fill in the Ditto development credentials." >&2
    exit 1
fi

mkdir -p "$output_dir"
output="$output_dir/Env.swift"

# Built in memory rather than through a temporary file: Xcode's user script
# sandbox only grants write access to the declared output path.
contents=$(
    printf '%s\n' 'import Foundation' '' '// Generated from the root .env file by buildEnv.sh. Do not edit.' '' 'enum Env {'
    for key in $REQUIRED_KEYS; do
        printf '    static let %s = "%s"\n' "$key" "$(swift_literal "$(read_env_value "$key")")"
    done
    printf '%s' '}'
)

# Only rewrite the file when it changes, so Xcode does not recompile on every
# incremental build.
if [ -f "$output" ] && [ "$contents" = "$(cat "$output")" ]; then
    exit 0
fi

printf '%s\n' "$contents" > "$output"
