package com.project.service;

import com.project.dto.ReviewDTO;
import com.project.model.Customer;
import com.project.model.Product;
import com.project.model.Review;
import com.project.repository.CustomerRepository;
import com.project.repository.ProductRepository;
import com.project.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private StorageService storageService;

    @Override
    public List<ReviewDTO> getReviewsByProductId(Long productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Review createReview(Long productId, Long customerId, Integer rating, String comment, MultipartFile mediaFile) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));

        Review review = new Review();
        review.setProduct(product);
        review.setCustomer(customer);
        review.setRating(rating);
        review.setComment(comment);
        review.setReviewDate(LocalDateTime.now());

        if (mediaFile != null && !mediaFile.isEmpty()) {
            String mediaUrl = storageService.store(mediaFile, customerId);
            review.setMediaUrl(mediaUrl);
        }

        return reviewRepository.save(review);
    }

    private ReviewDTO convertToDTO(Review review) {
        return new ReviewDTO(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getReviewDate(),
                review.getCustomer().getFirstName() + " " + review.getCustomer().getLastName(),
                review.getMediaUrl()
        );
    }
}
