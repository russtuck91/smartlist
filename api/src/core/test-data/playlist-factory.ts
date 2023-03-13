import * as Factory from 'factory.ts';
import moment from 'moment';
import { ObjectId } from 'mongodb';

import { Playlist, RuleGroupType } from '../../../../shared';

import { albumContainsRuleFactory, savedRuleFactory } from './playlist-rule-factory';
import randomStringFactory from './random-string-factory';


export const playlistFactory = Factory.Sync.makeFactory<Playlist>({
    id: randomStringFactory(24),
    createdAt: moment().toDate(),
    updatedAt: moment().toDate(),

    name: 'Test playlist name',

    rules: [{
        type: RuleGroupType.And,
        rules: [
            savedRuleFactory.build(),
        ],
    }],
    exceptions: [
        albumContainsRuleFactory.build(),
    ],
    userId: new ObjectId(),
});
