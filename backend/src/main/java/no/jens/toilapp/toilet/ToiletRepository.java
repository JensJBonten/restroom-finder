package no.jens.toilapp.toilet;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ToiletRepository extends JpaRepository<Toilet, Long> {

    List<Toilet> findAllByOrderByIdAsc();

    boolean existsByNameAndAddress(String name, String address);
}