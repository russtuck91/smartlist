import logger from '../../../core/logger/logger';
import { Album, Artist, SavedCacheRecord } from '../../../core/shared-models';

import albumRepo from '../../../repositories/cache/spotify/album-repository';
import artistRepo from '../../../repositories/cache/spotify/artist-repository';


async function searchForGenre(text: string) {
    logger.debug('>>>> Entering searchForGenre()');

    const findConditions = { 'item.genres': { $regex: text, $options: 'i' } };
    const matchedArtists = await artistRepo.find({ conditions: findConditions });
    const matchedAlbums = await albumRepo.find({ conditions: findConditions });

    const recordToGenreMapReducer = (agg: Record<string, number>, record: SavedCacheRecord<Artist|Album>) => {
        record.item.genres
            .filter((genre) => genre.toLowerCase().includes(text.toLowerCase()))
            .map((genre) => {
                if (agg[genre] == null) { agg[genre] = 0; }
                agg[genre]++;
            });
        return agg;
    };
    const artistGenreMap = matchedArtists.reduce(recordToGenreMapReducer, {});
    const albumGenreMap = matchedAlbums.reduce(recordToGenreMapReducer, {});

    const artistGenres = Object.keys(artistGenreMap).sort((a, b) => artistGenreMap[b]! - artistGenreMap[a]!);
    const albumGenres = Object.keys(albumGenreMap).sort((a, b) => albumGenreMap[b]! - albumGenreMap[a]!);

    const uniqGenres = [...new Set([...artistGenres, ...albumGenres])];
    return uniqGenres;
}

export default searchForGenre;
