package com.eventsphere.repository;

import com.eventsphere.entity.event.ParticipantHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ParticipantHistoryRepository extends JpaRepository<ParticipantHistory, Long> {
}
