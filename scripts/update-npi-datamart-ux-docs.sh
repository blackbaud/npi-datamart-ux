# Fail the build if this step fails
set -e

# Only run for a release
if [[ "$IS_RELEASE" == "true" && "$IS_PRERELEASE" == "false" ]]; then
  echo -e "Starting to update npi-datamart-ux docs\n"

  # This is normally master
  branch="carcher"

  # What user will be committing to the sky-docs repo
  git config --global user.email "sky-build-user@blackbaud.com"
  git config --global user.name "Blackbaud Sky Build User"

  # Clones the npi-datamart-ux-docs repo into a "docs/" folder
  git clone --quiet --branch=$branch https://${GH_TOKEN}@github.com/blackbaud/npi-datamart.git docs > /dev/null

  # Copy jsdoc output
  cp -rf stache/. docs/content/API/npi-datamart-ux

  # Copy integrity hashes
#  cp -f dist/sri.json docs/npi-datamart-sri/npi-datamart-$RELEASE_VERSION.json

  # Commit and push all our changes to the repo
  cd docs
  git add -f .
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed $RELEASE_VERSION to npi-datamart-ux docs"
  git push -fq origin $branch > /dev/null

  echo -e "NPI Datamart UX Docs successfully updated.\n"
fi
