git pull
pnpm i
pnpm start
go build -o out/YTMusic ./server
cp config.yaml out/config.yaml
chmod +x out/YTMusic
./out/YTMusic
