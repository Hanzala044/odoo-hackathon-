-- AlterTable
ALTER TABLE `Attendance` ADD COLUMN `breakStart` DATETIME(3) NULL,
    ADD COLUMN `breaks` JSON NULL,
    ADD COLUMN `totalMinutes` INTEGER NULL;

-- AlterTable
ALTER TABLE `Company` MODIFY `logo` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `LeaveRequest` MODIFY `remarks` TEXT NULL,
    MODIFY `adminComment` TEXT NULL;

-- AlterTable
ALTER TABLE `Profile` MODIFY `profilePic` LONGTEXT NULL,
    MODIFY `documents` TEXT NULL;
