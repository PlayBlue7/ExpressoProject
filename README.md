Welcome to Expresso, a QR code menu ordering and recommendation system!

## Running the code

The majority of development was performed on a Mac for local deployment on iOS, so if you have these devices you can install the native app, provided you have Xcode installed.

Then, ensure you have npm and cocoapods installed (through Homebrew).

Then run 
```bash
npm install

pod install

npx react-native start

```

Then in a separate terminal window,

```bash
npx react-native run-ios
```

If all goes smoothly you should have the app running on a local Simulator!


To run the web app, first run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## API keys

Unfortunately, due to my own personal privacy, I have redacted the Google API keys, but if you would like to run the app with Google service, please get in touch at aaron.hoskin@warwick.ac.uk

Thanks!


## Google Cloud Functions

The recommendation system runs on a Google Cloud Function server instance, to reduce local computation and excessive data downloads. Therefore, I have included the exact Python code and requirements text file that would run on such an instance. Therefore, it is not possible to run the recommendation system with data stored in the database, but I have showcased the results and shown in the presentation that this code works.