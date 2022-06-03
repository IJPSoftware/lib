#!/usr/bin/env bash

repo='IJPSoftware/lib'
tag=$1

if [[ -z "$tag" ]]; then
  echo "Tag missing"
fi

if [[ ! -d "./release" ]]; then
  mkdir release
fi

tar --exclude 'node_modules' --exclude '.turbo' -czvf "./releases/react-chat-box.tar.gz" -C "./packages/react/chat-box" .

gh release create "$tag" -t "$tag" -n "$tag" -R "$repo" "./releases/react-chat-box.tar.gz"
