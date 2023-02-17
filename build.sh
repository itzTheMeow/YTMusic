rm -rf out
mkdir out
cd server
echo "Compiling server binary..."
go install
go build -o ../out/YTMusic
cd ..
echo "Building frontend..."
node build.mjs
cp src/index.html out/index.html
echo "Done!"
