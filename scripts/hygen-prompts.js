module.exports = {
  // const packageTypes = ['sanity-plugin', 'other'].sort();
  promptPackage:
    (packageType) =>
    async ({ prompter }) => {
      const isSanityPlugin = packageType === 'sanity-plugin';
      const packageTypePrefix = isSanityPlugin ? 'sanity-plugin-nrkno-' : 'nrkno-';

      const suffixAnswer = await prompter.prompt([
        {
          type: 'input',
          name: 'packageSuffix',
          message: `Package name without @nrk/${packageTypePrefix} (will be prepended automatically)?`,
        },
      ]);

      return {
        packageType,
        package: `${packageTypePrefix}${suffixAnswer.packageSuffix}`,
      };
    },
};
