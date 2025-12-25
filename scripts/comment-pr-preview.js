/**
 * Posts or updates a comment on a PR with NPM preview release information.
 * Used by the release workflow to notify about preview versions.
 *
 * Expected environment variables:
 * - PREVIEW_VERSION: The preview version that was published
 *
 * @param {object} github - GitHub API client from actions/github-script
 * @param {object} context - GitHub Actions context
 */
module.exports = async ({ github, context }) => {
  const version = process.env.PREVIEW_VERSION;

  const body = `## 📦 NPM Preview Release

A preview version has been published to NPM:

\`\`\`bash
yarn add @flagsmith/backstage-plugin@${version}
# or
yarn add @flagsmith/backstage-plugin@next
\`\`\`

This preview will be updated with each new commit to this PR.`;

  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  });

  const botComment = comments.find(
    c => c.user.type === 'Bot' && c.body.includes('NPM Preview Release'),
  );

  if (botComment) {
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: botComment.id,
      body,
    });
  } else {
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body,
    });
  }
};
