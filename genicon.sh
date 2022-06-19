#! /bin/bash


mkdir icon.iconset

sizes=(16 32 128 256 512)

for size in ${sizes[*]}
do
    sips -z $size $size ./resource/static/katana.png --out ./icon.iconset/icon_${size}x${size}.png

    sips -z $(( $size * 2 )) $(( $size * 2 )) ./resource/static/katana.png --out ./icon.iconset/icon_${size}x${size}@2x.png
done

# macos
iconutil -c icns icon.iconset

# windows
# magick convert 16.png 24.png 32.png 48.png 64.png 72.png 96.png 128.png 256.png windows.ico