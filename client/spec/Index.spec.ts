import * as index from "@src/Index";

describe("Index", () => {
    it("handles invalid urls", () => {
        const invalidUrlSpy = spyOn(index, "invalidUrl").and.callThrough();
        index.main("http://localhost:8080");
        expect(invalidUrlSpy).toHaveBeenCalled();
    });

    it("will launch singleplayer if query parameter is set", () => {
        const singlePlayerSpy = spyOn(index, "launchSinglePlayer");
        index.main("http://localhost:8080?single-player=true");
        expect(singlePlayerSpy).toHaveBeenCalled();
        singlePlayerSpy.and.callThrough();
    });

    it("will launch a real client if url query parameter exists", () => {
        const expectedUrl = "ws://127.0.0.1:9001";
        const launchClientSpy = spyOn(index, "launchClient");
        const url = `http://localhost:8080?url=${encodeURIComponent(expectedUrl)}`;
        index.main(url);
        expect(launchClientSpy).toHaveBeenCalledWith(expectedUrl);
        launchClientSpy.and.callThrough();
    });
});