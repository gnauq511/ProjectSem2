package com.project.service;

import com.project.dto.ReviewDTO;
import com.project.model.Review;

import java.util.List;

public interface ReviewService {
    List<ReviewDTO> getReviewsByProductId(Long productId);
    Review createReview(Review review);
}
