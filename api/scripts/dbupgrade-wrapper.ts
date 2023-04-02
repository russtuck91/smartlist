import 'reflect-metadata';

import mongoutils from '@seiren/mongoutils';
import fs from 'fs';
import rimraf from 'rimraf';

import { MONGODB_URI } from '../src/core/db/db';
import logger from '../src/core/logger/logger';
import dbversionRepo from '../src/repositories/dbversion-repository';

import { BACKUP_DIRECTORY } from './constants';
import restoreDatabase from './restore-database';


async function getCurrentVersion(): Promise<string> {
    const dbversion = await dbversionRepo.findOne({});
    return dbversion?.version || '1.0.0';
}

async function setNewVersion(newVersion: string, filename: string) {
    await dbversionRepo.findOneAndUpdate({
        conditions: {},
        updates: {
            $set: {
                version: newVersion,
                source: filename,
                updatedAt: new Date(),
            },
        },
        upsert: true,
    });
}

async function backupDatabase() {
    logger.debug('>>>> Entering backupDatabase()');
    const info = mongoutils.parseMongoUrl(MONGODB_URI);
    const command = mongoutils.createDumpCommand(info, BACKUP_DIRECTORY);
    await mongoutils.executeCommand(command);
}

function deleteBackup() {
    logger.debug('>>>> Entering deleteBackup()');
    rimraf.sync(BACKUP_DIRECTORY);
}


async function dbUpgradeWrapper() {
    // Get all files in /dbupgrade/ folder
    const files = fs.readdirSync('scripts/dbupgrade').filter((f) => f.match(new RegExp('^upgrade-\\d+\\.\\d+\\.\\d+-\\d+\\.\\d+\\.\\d+-.*\\.ts$')));

    let checkForUpgrades = true;
    while (checkForUpgrades) {
        // Check current DB version from DB
        const currentVersion = await getCurrentVersion();
        logger.info(`DB is at version: ${currentVersion}`);

        // Find upgrade script targeting this current version
        const currentUpgradeScript: string|undefined = files.find((f) => f.match(new RegExp(`^upgrade-${currentVersion}-\\d+\\.\\d+\\.\\d+-.*\\.ts$`)));

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
            const script = require(`./dbupgrade/${ currentUpgradeScript}`);
            await script.default();

            // Success!
            logger.info(`Successfully completed upgrade script to version: ${newVersion}`);

            // Update db version info
            await setNewVersion(newVersion, currentUpgradeScript);

            if (process.env.NODE_ENV !== 'development') {
                deleteBackup();
            }

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

