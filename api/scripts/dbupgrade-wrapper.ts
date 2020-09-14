import mongoutils from '@seiren/mongoutils';
import fs from 'fs';
import rimraf from 'rimraf';

import { db, MONGODB_URI } from '../src/core/db/db';


const BACKUP_DIRECTORY = 'dbdump';

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

async function restoreDatabase() {
    const info = mongoutils.parseMongoUrl(MONGODB_URI);
    const command = mongoutils.createRestoreCommand(info, BACKUP_DIRECTORY + '/smartlist');
    const enhCommand = command + ' --drop --preserveUUID';
    await mongoutils.executeCommand(enhCommand);
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
        console.log('DB is at version: ', currentVersion);

        // Find upgrade script targeting this current version
        const currentUpgradeScript: string|undefined = files.find(f => f.match(new RegExp(`^upgrade-${currentVersion}-\\d+\\.\\d+\\.\\d+-.*\\.ts$`)));

        if (!currentUpgradeScript) {
            console.log('No DB upgrades to make');
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
            console.log('Successfully completed upgrade script to version: ', newVersion);

            // Update db version info
            await setNewVersion(newVersion, currentUpgradeScript);

            deleteBackup();

        } catch (e) {
            // Error handling
            console.log('Error running upgrade script');
            console.log(e);

            // Restore backup
            await restoreDatabase();

            throw e;
        }
    }

    if (!process.env.NODE_ENV) {
        process.exit();
    }
}

dbUpgradeWrapper();

