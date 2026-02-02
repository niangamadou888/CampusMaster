package com.campusmaster.DAO;

import com.campusmaster.Entity.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseMaterialDAO extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findByCourseId(Long courseId);
    List<CourseMaterial> findByCourseIdOrderByUploadedAtDesc(Long courseId);

    @Query("SELECT cm FROM CourseMaterial cm WHERE cm.course.id = :courseId AND cm.fileType = :fileType")
    List<CourseMaterial> findByCourseIdAndFileType(@Param("courseId") Long courseId, @Param("fileType") CourseMaterial.FileType fileType);

    @Modifying
    @Query("UPDATE CourseMaterial cm SET cm.downloadCount = cm.downloadCount + 1 WHERE cm.id = :id")
    void incrementDownloadCount(@Param("id") Long id);

    @Query("SELECT SUM(cm.downloadCount) FROM CourseMaterial cm WHERE cm.course.id = :courseId")
    Long getTotalDownloadsByCourse(@Param("courseId") Long courseId);
}
