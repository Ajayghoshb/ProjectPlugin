export class TeamsManifestPlaceholder {
  public static generateManifestSchema(): any {
    return {
      $schema: 'https://developer.microsoft.com/en-us/json-schemas/teams/v1.15/MicrosoftTeams.schema.json',
      manifestVersion: '1.15',
      version: '1.0.0'
    };
  }
}
