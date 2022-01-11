## Scope
<!-- what is the PR about? -->

## Reviewers
<!-- what do you expect reviewers to do? -->

## Checklist
I have:
- [ ] used [conventional commit messages](https://www.conventionalcommits.org/en/v1.0.0/#summary)
- [ ] committed with git-hooks active (ran npm install at least once locally before committing)
- [ ] considered if this is a breaking change
- [ ] tested the changes using npm link / yarn link
- [ ] triggered nrkno-sanity-libs-releaser for this branch and checked the status

The branch-build must be manually triggered by the nrk.no team using nrkno-sanity-libs-releaser.

After merging, new version(s) should be published to npm by by triggering
nrkno-sanity-libs-releaser for the master branch.

These manual steps are a safeguard to prevent accidental releases and version changes.

