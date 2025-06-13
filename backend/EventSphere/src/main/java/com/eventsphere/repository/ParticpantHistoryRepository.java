package com.eventsphere.repository;

import com.eventsphere.entity.event.ParticipantHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticpantHistoryRepository extends JpaRepository<ParticipantHistory, Long> {
}
