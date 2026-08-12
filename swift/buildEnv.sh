#!/bin/sh

if [ "$#" -ne 2 ]; then
    echo "usage: buildEnv.sh /path/to/.env /output/path" >&2
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "Missing root .env file. Copy .env.template to .env and fill in the Ditto development credentials." >&2
    exit 1
fi

output="$2/Env.swift"
{
    printf '%s\n' 'import Foundation' '' '// Generated from the root .env file. Do not edit.' '' 'struct Env {'
    while IFS= read -r line || [ -n "$line" ]; do
        case "$line" in
            ''|'#'*) continue ;;
        esac
        key=${line%%=*}
        value=${line#*=}
        printf '    static let %s = "%s"\n' "$key" "$value"
    done < "$1"
    printf '%s\n' '}'
} > "$output"
