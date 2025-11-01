#!/usr/bin/env python3
import os
import click
import requests
import json

CONFIG_PATH = os.path.expanduser("~/.makebreak_config.json")
API_BASE_URL = "http://localhost:8000/api"  # change if needed


def save_token(token: str):
    with open(CONFIG_PATH, "w") as f:
        json.dump({"accessToken": token}, f)


def load_token():
    if os.path.exists(CONFIG_PATH):
        with open(CONFIG_PATH, "r") as f:
            data = json.load(f)
            return data.get("accessToken")
    return None


def login(email, password):
    print("🔐 Logging in...")
    try:
        res = requests.post(f"{API_BASE_URL}/auth/login", json={"email": email, "password": password})
        if res.status_code != 200:
            print("❌ Login failed:", res.text)
            return None

        data = res.json()

        # Handle multiple possible API response formats
        token = (
            data.get("accessToken")
            or data.get("token")
            or (data.get("data") and data["data"].get("accessToken"))
        )

        if not token or not isinstance(token, str):
            print("❌ No valid token found in response:", data)
            return None

        save_token(token)
        print("✅ Login successful!")
        return token

    except requests.exceptions.RequestException as e:
        print("❌ Network error:", e)
        return None


@click.group()
@click.option("--email", help="User email")
@click.option("--password", help="User password")
@click.pass_context
def cli(ctx, email, password):
    """
    MakeBreak CLI — Manage presentations via terminal.
    """
    ctx.ensure_object(dict)
    token = load_token()

    if not token and email and password:
        token = login(email, password)
    elif not token:
        print("⚠️  Please log in first using: makebreak --email [email] --password [password] ...")
        exit(1)

    ctx.obj["token"] = token


@cli.group()
def presentation():
    """Presentation related commands"""
    pass


@presentation.command("add")
@click.option("-t", "--title", required=True, help="Presentation title")
@click.option("-mdp", "--markdown_path", required=True, help="Path to markdown file")
@click.pass_context
def add_presentation(ctx, title, markdown_path):
    """Add a new presentation using a markdown file"""
    token = ctx.obj["token"]

    if not os.path.exists(markdown_path):
        print(f"❌ File not found: {markdown_path}")
        return

    with open(markdown_path, "r", encoding="utf-8") as f:
        markdown_content = f.read()

    if not token:
        print("❌ No valid access token found. Please log in again.")
        return

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    data = {"title": title, "content": markdown_content}

    print("📤 Uploading presentation...")
    try:
        res = requests.post(
            f"{API_BASE_URL}/presentations/create-new-presentation",
            json=data,
            headers=headers,
        )

        if res.status_code in [200, 201]:
            print("✅ Presentation created successfully!")
        else:
            print("❌ Failed to create presentation:", res.text)

    except requests.exceptions.RequestException as e:
        print("❌ Request failed:", e)


if __name__ == "__main__":
    cli()
