mkdir out

git pull
rm -rf dist
pnpm i
pnpm start
rm -rf server/dist
cp -r dist server
go build -o out/YTMusic ./server
chmod +x out/YTMusic
cp -n config.yaml out/config.yaml
echo "Done building!"
