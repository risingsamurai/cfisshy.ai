#!/usr/bin/env sh
if [ -z "$husky_skip_init" ]; then
  readonly hook_name="$(basename -- "$0")"
  if [ "$HUSKY" = "0" ]; then
    exit 0
  fi
fi
