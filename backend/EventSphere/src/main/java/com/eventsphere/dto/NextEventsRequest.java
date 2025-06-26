package com.eventsphere.dto;

import java.util.List;

public class NextEventsRequest {
    private boolean onlyPublic;
    private boolean onlyMine;
    
    public boolean isOnlyPublic() {
        return onlyPublic;
    }
    public void setOnlyPublic(boolean onlyPublic) {
        this.onlyPublic = onlyPublic;
    }
    public boolean isOnlyMine() {
        return onlyMine;
    }
    public void setOnlyMine(boolean onlyMine) {
        this.onlyMine = onlyMine;
    }
}
