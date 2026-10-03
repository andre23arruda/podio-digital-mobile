expo:
	npx expo start

build-apk:
	npx -y eas-cli build -p android --profile preview