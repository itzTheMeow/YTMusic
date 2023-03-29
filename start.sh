pnpm run outdir

git pull
rm -rf dist
pnpm i
pnpm start
rm -rf server/dist
cp -r dist server
go build -o out/YTMusic ./server
cp config.yaml out/config.yaml
chmod +x out/YTMusic
echo "Done building!"
