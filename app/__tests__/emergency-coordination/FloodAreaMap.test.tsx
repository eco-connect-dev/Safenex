import React from "react";
import {
    fireEvent,
    render,
    screen,
} from "@testing-library/react-native";

import { FloodAreaMap } from "@/src/features/emergency-coordination/components/FloodAreaMap";
import { sampleActiveEmergency } from "@/src/features/emergency-coordination/sampleData";

describe("FloodAreaMap", () => {
    const onSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all supplied locations", async () => {
        await render(
            <FloodAreaMap
                district="Kegalle"
                locations={sampleActiveEmergency.locations}
                selectedId={null}
                onSelect={onSelect}
            />,
        );

        for (const location of sampleActiveEmergency.locations) {
            expect(
                screen.getByTestId(`map-location-${location.id}`),
            ).toBeTruthy();

            expect(screen.getByText(location.name)).toBeTruthy();
        }
    });

    it("passes the selected location ID to the callback", async () => {
        await render(
            <FloodAreaMap
                district="Kegalle"
                locations={sampleActiveEmergency.locations}
                selectedId={null}
                onSelect={onSelect}
            />,
        );

        fireEvent.press(screen.getByTestId("map-location-l4"));

        expect(onSelect).toHaveBeenCalledWith("l4");
    });

    it("passes null when the selected location is pressed again", async () => {
        await render(
            <FloodAreaMap
                district="Kegalle"
                locations={sampleActiveEmergency.locations}
                selectedId="l4"
                onSelect={onSelect}
            />,
        );

        fireEvent.press(screen.getByTestId("map-location-l4"));

        expect(onSelect).toHaveBeenCalledWith(null);
    });

    it("shows an epicentre label for the selected epicentre", async () => {
        await render(
            <FloodAreaMap
                district="Kegalle"
                locations={sampleActiveEmergency.locations}
                selectedId="l2"
                onSelect={onSelect}
            />,
        );

        expect(
            screen.getByText("Selected: Kegalle (epicentre)"),
        ).toBeTruthy();
    });

    it("renders safely when there are no locations", async () => {
        await render(
            <FloodAreaMap
                district="Kegalle"
                locations={[]}
                selectedId={null}
                onSelect={onSelect}
            />,
        );

        expect(screen.getByTestId("flood-map-card")).toBeTruthy();
        expect(
            screen.getByText("Tap a location to focus it."),
        ).toBeTruthy();

        expect(screen.queryAllByRole("button")).toHaveLength(0);
    });
});
