import mongoutils from '@seiren/mongoutils';
import fs from 'fs';
import rimraf from 'rimraf';

import { db, MONGODB_URI } from '../src/core/db/db';
import logger from '../src/core/logger/logger';
import restoreDatabase from './restore-database';
import { BACKUP_DIRECTORY } from './constants';


async function getCurrentVersion(): Promise<string> {
    const dbversion = await db.dbversion.findOne();
    return dbversion.version;
}

async function setNewVersion(newVersion: string, filename: string) {
    await db.dbversion.update(
        {},
        {
            $set: {
                version: newVersion,
                source: filename,
                updatedAt: new Date()
            },
        },
        { upsert: true }
    );
}

async function backupDatabase() {
    const info = mongoutils.parseMongoUrl(MONGODB_URI);
    const command = mongoutils.createDumpCommand(info, BACKUP_DIRECTORY);
    await mongoutils.executeCommand(command);
}

function deleteBackup() {
    rimraf.sync(BACKUP_DIRECTORY);
}


async function dbUpgradeWrapper() {
    // Get all files in /dbupgrade/ folder
    const files = fs.readdirSync('scripts/dbupgrade').filter(f => f.match(new RegExp('^upgrade-\\d+\\.\\d+\\.\\d+-\\d+\\.\\d+\\.\\d+-.*\\.ts$')));

    let checkForUpgrades = true;
    while (checkForUpgrades) {
        // Check current DB version from DB
        const currentVersion = await getCurrentVersion();
        logger.info(`DB is at version: ${currentVersion}`);

        // Find upgrade script targeting this current version
        const currentUpgradeScript: string|undefined = files.find(f => f.match(new RegExp(`^upgrade-${currentVersion}-\\d+\\.\\d+\\.\\d+-.*\\.ts$`)));

        if (!currentUpgradeScript) {
            logger.info('No DB upgrades to make');
            checkForUpgrades = false;
            break;
        }

        // Make a backup
        await backupDatabase();

        try {
            const newVersion = currentUpgradeScript.replace(new RegExp('^upgrade-\\d+\\.\\d+\\.\\d+-(\\d+\\.\\d+\\.\\d+)-.*\\.ts$'), '$1');
            // Run the script
            const script = require('./dbupgrade/' + currentUpgradeScript);
            await script.default();

            // Success!
            logger.info(`Successfully completed upgrade script to version: ${newVersion}`);

            // Update db version info
            await setNewVersion(newVersion, currentUpgradeScript);

            deleteBackup();

        } catch (e) {
            // Error handling
            logger.info('Error running upgrade script');
            logger.error(e);

            // Restore backup
            await restoreDatabase();

            throw e;
        }
    }

    process.exit();
}

dbUpgradeWrapper();

