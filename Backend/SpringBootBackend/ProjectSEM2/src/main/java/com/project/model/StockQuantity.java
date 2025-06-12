package com.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "stock_quantity")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockQuantity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stock_quantity_id")
    private Long id;

    @Column(name = "s_quantity")
    private int sQuantity;

    @Column(name = "m_quantity")
    private int mQuantity;

    @Column(name = "l_quantity")
    private int lQuantity;

    @Column(name = "xl_quantity")
    private int xlQuantity;

    @Column(name = "xxl_quantity")
    private int xxlQuantity;
}
