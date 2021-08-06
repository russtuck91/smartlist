function findImageAtLeastSize(images: SpotifyApi.ImageObject[], px: number) {
    return images.reduce<SpotifyApi.ImageObject|undefined>((result, curr) => {
        if (result && (
            (result.height && curr.height && result.height < curr.height) ||
            (result.width && curr.width && result.width < curr.width)
        )) {
            return result;
        }
        if (
            curr.height && curr.height >= px ||
            curr.width && curr.width >= px
        ) {
            return curr;
        }
        return result;
    }, undefined);
}

export default findImageAtLeastSize;
