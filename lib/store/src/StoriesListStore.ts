import { Channel } from '@storybook/addons';
import { StoryId } from '@storybook/csf';

import { StorySpecifier, Path, StoriesList, StoriesListStory } from './types';

export class StoriesListStore {
  fetchStoriesList: () => Promise<StoriesList> | StoriesList;

  channel: Channel;

  storiesList: StoriesList;

  constructor({ fetchStoriesList }: { fetchStoriesList: StoriesListStore['fetchStoriesList'] }) {
    this.fetchStoriesList = fetchStoriesList;
  }

  async initialize() {
    return this.cacheStoriesList();
  }

  initializeSync() {
    return this.cacheStoriesListSync();
  }

  async onStoriesChanged() {
    this.storiesList = await this.fetchStoriesList();
  }

  async cacheStoriesList() {
    this.storiesList = await this.fetchStoriesList();
  }

  async cacheStoriesListSync() {
    this.storiesList = this.fetchStoriesList() as StoriesList;
    if (!this.storiesList.v) {
      throw new Error(
        `fetchStoriesList() didn't return a stories list, did you pass an async version then call initializeSync()?`
      );
    }
  }

  storyIdFromSpecifier(specifier: StorySpecifier) {
    const storyIds = Object.keys(this.storiesList.stories);
    if (specifier === '*') {
      // '*' means select the first story. If there is none, we have no selection.
      return storyIds[0];
    }

    if (typeof specifier === 'string') {
      // Find the story with the exact id that matches the specifier (see #11571)
      if (storyIds.indexOf(specifier) >= 0) {
        return specifier;
      }
      // Fallback to the first story that starts with the specifier
      return storyIds.find((storyId) => storyId.startsWith(specifier));
    }

    // Try and find a story matching the name/kind, setting no selection if they don't exist.
    const { name, title } = specifier;
    const match = Object.entries(this.storiesList.stories).find(
      ([id, story]) => story.name === name && story.title === title
    );

    return match && match[0];
  }

  storyIdToMetadata(storyId: StoryId): StoriesListStory {
    const storyMetadata = this.storiesList.stories[storyId];
    if (!storyMetadata) {
      throw new Error(`Didn't find '${storyId}' in story metadata (\`stories.json\`)`);
    }

    return storyMetadata;
  }
}