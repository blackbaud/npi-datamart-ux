# Fail the build if this step fails
set -e

echo -e "update-npi-datamart-ux.sh"

# Update the dist folder of the current branch, as long as it's a push and not a savage- branch.
if [[ "$TRAVIS_PULL_REQUEST" == "false" && ! $TRAVIS_BRANCH =~ $SAVAGE_BRANCH ]]; then
  echo -e "Starting to update npi-datamart-ux.\n"

  git config --global user.email "sky-build-user@blackbaud.com"
  git config --global user.name "Blackbaud Sky Build User"
  git clone --quiet --branch=$TRAVIS_BRANCH https://${GH_TOKEN}@github.com/blackbaud/npi-datamart-ux.git npiux > /dev/null

  cp -rf dist/ npiux/
  cd npiux

  git add dist/

  if [ -z "$(git status --porcelain)" ]; then
    echo -e "No changes to commit to npi-datamart-ux."
  else
    git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to npi-datamart-ux [ci skip]"
    git push -fq origin $TRAVIS_BRANCH > /dev/null
    echo -e "npi-datamart-ux successfully updated.\n"

    # Update "dev" in npi-datamart-ux-releases
#    if [[ "$IS_RELEASE" == "false" ]]; then
#
#      echo -e "Starting to update npiux-releases dev folder.\n"
#      cd ../
#      git clone --quiet https://${GH_TOKEN}@github.com/blackbaud/npi-datamart-ux-releases.git npi-datamart-ux-releases-repo > /dev/null
#      cp -rf dist/. npi-datamart-ux-releases-repo/releases/npiux/dev/
#      cd npi-datamart-ux-releases-repo
#      git add -f .
#
#      if [ -z "$(git status --porcelain)" ]; then
#        echo -e "No changes to commit to npi-datamart-ux-releases dev folder."
#      else
#        git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to npi-datamart-ux-releases"
#        git push -fq origin master > /dev/null
#        echo -e "npi-datamart-ux-releases dev folder successfully updated.\n"
#      fi
#
#    fi

  fi

fi
