import { UserRepository } from './UserRepository';
import { CharacterRepository } from './CharacterRepository';
import { PostRepository } from './PostRepository';
import { DocumentRepository } from './DocumentRepository';
import { PartyRepository } from './PartyRepository';
import { MapRepository } from './MapRepository';
import { ResourceRepository } from './ResourceRepository';
import { SettingsRepository } from './SettingsRepository';
import { SystemSettingRepository } from './SystemSettingRepository';

export const repositories = {
  user: new UserRepository(),
  character: new CharacterRepository(),
  post: new PostRepository(),
  document: new DocumentRepository(),
  party: new PartyRepository(),
  map: new MapRepository(),
  resource: new ResourceRepository(),
  settings: new SettingsRepository(),
  systemSetting: new SystemSettingRepository()
};
