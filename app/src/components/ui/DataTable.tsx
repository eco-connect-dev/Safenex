import { ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/src/theme";

export type DataTableColumn<T> = {
  key: keyof T;
  label: string;
  flex?: number;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export type DataTableProps<T extends { id: string }> = {
  columns: DataTableColumn<T>[];
  rows: T[];
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
}: DataTableProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <View style={[styles.row, styles.header]}>
          {columns.map((column) => (
            <Text
              key={String(column.key)}
              style={[styles.cell, { flex: column.flex ?? 1 }]}
            >
              {column.label}
            </Text>
          ))}
        </View>
        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            {columns.map((column) => (
              <View
                key={String(column.key)}
                style={[styles.cellContainer, { flex: column.flex ?? 1 }]}
              >
                {column.render ? (
                  column.render(row[column.key], row)
                ) : (
                  <Text style={styles.cell}>
                    {String(row[column.key] ?? "")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: { minWidth: 640 },
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 48,
  },
  header: { backgroundColor: colors.background },
  cellContainer: { justifyContent: "center", paddingHorizontal: spacing.md },
  cell: { color: colors.text, fontSize: typography.sizes.sm },
});
