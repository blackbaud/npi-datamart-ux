# Fail the build if this step fails
set -e

# Update the dist folder of the current branch, as long as it's a push and not a savage- branch.
if [[ "$TRAVIS_PULL_REQUEST" == "false" && ! $TRAVIS_BRANCH =~ $SAVAGE_BRANCH ]]; then
  echo -e "\nStarting to update npi-datamart-ux."

  git config --global user.email "sky-build-user@blackbaud.com"
  git config --global user.name "Blackbaud Sky Build User"
  git clone --quiet --branch=$TRAVIS_BRANCH https://${GH_TOKEN}@github.com/blackbaud/npi-datamart-ux.git npiux > /dev/null

  cp -rf dist/ npiux/
  cd npiux

  git add dist/

  if [ -z "$(git status --porcelain)" ]; then
    echo -e "No changes to commit to npi-datamart-ux.\n"
  else
    git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to npi-datamart-ux [ci skip]"
    git push -fq origin $TRAVIS_BRANCH > /dev/null
    echo -e "npi-datamart-ux successfully updated.\n"

  fi

fi
