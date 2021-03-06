# Fail the build if this step fails
set -e

# Only run for releases
if [[ "$IS_RELEASE" == "true" ]]; then
  echo -e "Starting to update npi-datamart-ux releases.\n"

  # What user will be committing to the sky-docs repo
  git config --global user.email "sky-build-user@blackbaud.com"
  git config --global user.name "Blackbaud Sky Build User"
  
  #git clone --quiet https://${GH_TOKEN}@github.com/blackbaud/npi-datamart-ux.git npiux > /dev/null

  # Verify the version doesn't already exist
  if [[ -d "npiux/releases/$RELEASE_VERSION" ]]; then
    echo "npi-datamart-ux releases already contains version $RELEASE_VERSION"
    exit 1
  else

    # Copy the dist folder
    cp -rf dist/. npiux/releases/$RELEASE_VERSION/

    # Commit and push all our changes to the repo
    cd npiux
    git add -f .
    git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed $RELEASE_VERSION to npi-datamart-ux releases [ci skip]"
    git push -fq origin master > /dev/null

    echo -e "npi-datamrt-ux releases successfully updated.\n"

    # Publish to NPM
    cd ../
    echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc
    npm whoami
    npm publish
    echo -e "npi-datamart-ux successfully deployed to NPM.\n"

  fi
fi
