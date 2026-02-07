#!/bin/bash
# ─────────────────────────────────────────────────────────
# Kindle Sender — double-click this file to launch the app
# ─────────────────────────────────────────────────────────

# Navigate to the folder this script lives in
cd "$(dirname "$0")"

# ── First-run setup ──────────────────────────────────────
if [ ! -d ".venv" ]; then
    echo ""
    echo "  First launch — setting up Kindle Sender..."
    echo "  (this only happens once)"
    echo ""

    # Check for Python 3
    if ! command -v python3 &> /dev/null; then
        echo "  Python 3 is required but not installed."
        echo "  Install it from https://www.python.org/downloads/"
        echo ""
        echo "  Press any key to close."
        read -n 1
        exit 1
    fi

    # Create virtual environment
    python3 -m venv .venv
    source .venv/bin/activate

    # Install dependencies
    echo "  Installing dependencies..."
    pip install --upgrade pip -q
    pip install -r requirements.txt -q

    echo ""
    echo "  Setup complete!"
    echo ""
else
    source .venv/bin/activate
fi

# ── Launch the app ───────────────────────────────────────
echo ""
echo "  Starting Kindle Sender..."
echo ""
python app.py
