deploy:
	graph codegen
	graph build
	yarn run remove-local
	yarn run create-local
	yarn run deploy-local