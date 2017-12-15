echo "---- Running npm install ----"
npm install
echo "--- Running npm bild ----"
npm run build
echo " --- copy env --"
cp /home/ubuntu/env/.env /home/ubuntu/ticker/current/dist/
echo " ---  swap directory --- "
mv current/ old_dist/ && mv dist/ current/
echo "---- cd current ----"
cd current/
echo "--- pm2 restart -----"
pm2 startOrRestart deploy/ecosystem.config.js -i 4 --update-env

