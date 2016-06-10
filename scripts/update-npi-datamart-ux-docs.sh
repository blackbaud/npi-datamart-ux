# Fail the build if this step fails
set -e

echo -e "Starting to update npi-datamart-ux docs\n"

# This is normally master
branch="carcher"

# Clones the npi-datamart repo into a "docs/" folder
git clone --quiet --branch=$branch https://${GH_TOKEN}@github.com/blackbaud/npi-datamart.git docs > /dev/null

# Copy jsdoc output
cp -rf stache/. docs/content/npi-datamart-ux

# What user will be committing to the sky-docs repo
git config --global user.email "sky-build-user@blackbaud.com"
git config --global user.name "Blackbaud Sky Build User"

# Commit and push all our changes to the repo
cd docs
git add -f .
if [ -z "$(git status --porcelain)" ]; then
  echo -e "No changes to commit to npi-datamart."
else
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to npi-datamart"
  git push -fq origin $branch > /dev/null
  echo -e "npi-datamart successfully updated.\n"

fi

# Only run for a release
if [[ "$IS_RELEASE" == "true" && "$IS_PRERELEASE" == "false" ]]; then

  echo -e "Starting to update npi-datamart stache site\n"

  cd ..

  # Clones npi-datamart Stache repo into a "web/" folder 
  git clone --quiet --branch=master http://npi-datamart.scm.docs.blackbaudhosting.com/npi-datamart.git web > /dev/null

  # Copy jsdoc output
  cp -rf stache/. web/content/npi-datamart-ux

  # Copy integrity hashes
#  cp -f dist/sri.json docs/npi-datamart-sri/npi-datamart-$RELEASE_VERSION.json

  cd web
  git add -f .
  if [ -z "$(git status --porcelain)" ]; then
    echo -e "No changes to commit to npi-datamart stache."
  else
    git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed $RELEASE_VERSION to npi-datamart stache"
    git push -fq website master > /dev/null
  fi
fi
  
echo -e "NPI Datamart UX Docs successfully updated.\n"
