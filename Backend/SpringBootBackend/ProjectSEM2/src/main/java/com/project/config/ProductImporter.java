package com.project.config;
import java.io.File;
import java.io.FileInputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ProductImporter {

    public static void main(String[] args) {
        String jdbcURL = "jdbc:mysql://localhost:3306/projectsem2";
        String username = "root";
        String excelFilePath = "D:\\projectSem2BullXit\\ProjectSem2\\Backend\\SpringBootBackend\\ProjectSEM2\\src\\main\\resources\\static\\imge.xlsx";

        try (Connection conn = DriverManager.getConnection(jdbcURL, username, "");
             FileInputStream inputStream = new FileInputStream(new File(excelFilePath));
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            String sql = "INSERT INTO product (description, image_url, image_view_2, image_view_3, image_view_4, name, price) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";
            PreparedStatement statement = conn.prepareStatement(sql);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                statement.setString(1, getCellValue(row.getCell(0))); // description
                statement.setString(2, getCellValue(row.getCell(1))); // image_url
                statement.setString(3, getCellValue(row.getCell(2))); // image_view_2
                statement.setString(4, getCellValue(row.getCell(3))); // image_view_3
                statement.setString(5, getCellValue(row.getCell(4))); // image_view_4
                statement.setString(6, getCellValue(row.getCell(5))); // name
                statement.setDouble(7, parseDouble(row.getCell(6))); // price

                statement.executeUpdate();
            }

            System.out.println("Dữ liệu đã được thêm thành công!");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String getCellValue(Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue();
            case NUMERIC: return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return null;
        }
    }

    private static double parseDouble(Cell cell) {
        if (cell == null) return 0.0;
        if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue());
            } catch (NumberFormatException e) {
                return 0.0;
            }
        }
        return 0.0;
    }
}