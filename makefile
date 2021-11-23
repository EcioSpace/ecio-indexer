deploy:
	graph codegen
	graph build
	yarn run remove-local
	yarn run create-local
	yarn run deploy-local

deploy-prod:
	graph codegen
	graph build
	graph auth --product hosted-service ${ACCESS_TOKEN}
	graph deploy --product hosted-service ${VENDOR}/${REPRO}