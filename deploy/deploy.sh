echo "---- Running npm install ----"
npm install
echo "--- Running npm bild ----"
npm run build
echo "---- cd dist ----"
cd dist/ 
echo " --- copy env --- "
cp /home/ubuntu/env/.env /home/ubuntu/ticker/current/dist/
echo "--- pm2 restart -----"
pm2 startOrRestart deploy/ecosystem.config.js -i 4 --update-env

