# Fail the build if this step fails
set -e

echo -e "Starting to update npi-datamart-ux docs"

# This is normally master
branch="master"

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
  echo -e "No changes to commit to npi-datamart.\n"
else
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to npi-datamart"
  git push -fq origin $branch > /dev/null
  echo -e "npi-datamart successfully updated.\n"
fi

