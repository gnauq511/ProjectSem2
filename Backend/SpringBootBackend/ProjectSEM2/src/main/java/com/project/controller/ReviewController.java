package com.project.controller;

import com.project.dto.ReviewDTO;
import com.project.model.Review;
import com.project.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviewsByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProductId(productId));
    }

    @PostMapping("/add")
    public ResponseEntity<Review> createReview(@RequestParam("productId") Long productId,
                                             @RequestParam("customerId") Long customerId,
                                             @RequestParam("rating") Integer rating,
                                             @RequestParam("comment") String comment,
                                             @RequestParam(value = "media", required = false) MultipartFile mediaFile) {
        Review createdReview = reviewService.createReview(productId, customerId, rating, comment, mediaFile);
        return ResponseEntity.ok(createdReview);
    }
}
