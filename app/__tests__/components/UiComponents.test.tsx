import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { DataTable } from "@/src/components/ui/DataTable";
import { MetricCard } from "@/src/components/ui/MetricCard";
import { Notice } from "@/src/components/ui/Notice";
import { Select } from "@/src/components/ui/Select";
import { TextField } from "@/src/components/ui/TextField";
import { FlowActions } from "@/src/features/hazard-reporting/components/FlowActions";
import { MobileHeader } from "@/src/features/hazard-reporting/components/MobileHeader";
import { ProgressSteps } from "@/src/features/hazard-reporting/components/ProgressSteps";

describe("shared UI components", () => {
  it("renders badges and notices with their supplied content", async () => {
    const view = await render(<><Badge label="Accepted" tone="success" /><Notice title="Saved" message="Your changes were saved." tone="success" /></>);
    expect(view.getByText("Accepted")).toBeTruthy();
    expect(view.getByText("Saved")).toBeTruthy();
    expect(view.getByText("Your changes were saved.")).toBeTruthy();
  });

  it("handles button presses and loading state", async () => {
    const onPress = jest.fn();
    const view = await render(<Button label="Save changes" onPress={onPress} />);
    await fireEvent.press(view.getByText("Save changes"));
    expect(onPress).toHaveBeenCalledTimes(1);
    const loading = await render(<Button label="Saving" loading />);
    expect(loading.getByRole("button").props.accessibilityState.disabled).toBe(true);
  });

  it("supports card children, metric values and table cell rendering", async () => {
    type Row = { id: string; name: string; count: number };
    const view = await render(<>
      <Card><Text>Card body</Text></Card>
      <MetricCard label="Active cases" value="12" change="+2" changeTone="negative" />
      <DataTable<Row> columns={[{ key: "name", label: "Name" }, { key: "count", label: "Count", render: (count) => <Text>{`#${count}`}</Text> }]} rows={[{ id: "r1", name: "Kelani", count: 3 }]} />
    </>);
    expect(view.getByText("Card body")).toBeTruthy();
    expect(view.getByText("12")).toBeTruthy();
    expect(view.getByText("Kelani")).toBeTruthy();
    expect(view.getByText("#3")).toBeTruthy();
  });

  it("selects an option and forwards text input changes", async () => {
    const onChange = jest.fn();
    const onTextChange = jest.fn();
    const view = await render(<>
      <Select label="District" options={[{ label: "Colombo", value: "colombo" }, { label: "Kandy", value: "kandy" }]} onChange={onChange} />
      <TextField label="Full name" placeholder="Type your name" value="" onChangeText={onTextChange} />
    </>);
    await fireEvent.press(view.getByText("Select an option"));
    await fireEvent.press(view.getByText("Kandy"));
    expect(onChange).toHaveBeenCalledWith("kandy");
    await fireEvent.changeText(view.getByPlaceholderText("Type your name"), "Nimal");
    expect(onTextChange).toHaveBeenCalledWith("Nimal");
  });

  it("renders report flow navigation and progress, including optional back action", async () => {
    const onBack = jest.fn();
    const onContinue = jest.fn();
    const view = await render(<>
      <MobileHeader title="Report a hazard" subtitle="Step 2 of 5" onBack={onBack} showProfile />
      <ProgressSteps current={2} total={5} />
      <FlowActions onBack={onBack} onContinue={onContinue} continueLabel="NEXT STEP" />
    </>);
    expect(view.getByText("Report a hazard")).toBeTruthy();
    expect(view.getByText("Step 2 of 5")).toBeTruthy();
    await fireEvent.press(view.getByText("BACK"));
    await fireEvent.press(view.getByText("NEXT STEP"));
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
