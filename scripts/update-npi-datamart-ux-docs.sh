# Fail the build if this step fails
set -e

# Only run for a release
if [[ "$IS_RELEASE" == "true" && "$IS_PRERELEASE" == "false" ]]; then
  echo -e "Starting to update npi-datamart-ux docs\n"

  # This is normally master
  branch="master"

  # What user will be committing to the sky-docs repo
  git config --global user.email "sky-build-user@blackbaud.com"
  git config --global user.name "Blackbaud Sky Build User"

  # Clones the sky-docs repo into a "docs/" folder
  git clone --quiet --branch=$branch https://${GH_TOKEN}@github.com/blackbaud/npi-datamart-ux-docs.git docs > /dev/null

  # Copy jsdoc output
#  cp -f demo/data/sky.json docs/npi-datamart-jsdoc/npi-datamart-$RELEASE_VERSION.json

  # Copy integrity hashes
#  cp -f dist/sri.json docs/npi-datamart-sri/npi-datamart-$RELEASE_VERSION.json

  # Updating this file will cause the documentation to be updated
  echo "$RELEASE_VERSION" > docs/includes/latest-release.txt

  # Create a timestamp file for stache to read
  echo "`date -u`" > docs/includes/timestamp.txt

  # Commit and push all our changes to the repo
  cd docs
  git add -f .
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed $RELEASE_VERSION to skyux-docs"
  git push -fq origin $branch > /dev/null

  echo -e "NPI Datamart UX Docs successfully updated.\n"
fi
