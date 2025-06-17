package com.project.service;

import com.project.dto.ReviewDTO;
import com.project.model.Review;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ReviewService {
    List<ReviewDTO> getReviewsByProductId(Long productId);
    Review createReview(Long productId, Long customerId, Integer rating, String comment, MultipartFile mediaFile);
}
